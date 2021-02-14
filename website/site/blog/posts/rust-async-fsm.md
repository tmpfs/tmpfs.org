+++
created = 2021-02-13
title = "Rust Async FSM"
description = "Async state machine in Rust"

[taxonomies]
tags = ["Rust", "Finite State Machines", "Async"]
+++

{{import "header"}}

This article assumes you are familiar with [Rust][] and async programming using futures; if you landed here I imagine you know what a [state machine][] is &ndash; so we won't discuss the benefits or use cases for state machines. The article outlines a FSM with flexible runtime requirements and is concerned with how to implement the design pattern using [Rust][].
 
See [this repository][source code] for the source code that accompanies this article; if you want to dive straight in see [main.rs][].

## Introduction

I recently needed to model a Finite State Machine (FSM) in Rust so took a look around at how other people were writing the state machine pattern and came across [hoverbear's article][article] which was useful as I also thought that `enum` would be the right type to model a state machine but quickly realized it was not a good fit.

The approach in the [article][] implementing `From` is elegant and gives good compile-time guarantees on which states may transition to other states but was not suitable for my requirements. I needed a more flexible implementation that could operate easily on sub sets of a list of states, skip states based on conditions and it needed to be `async` and use idiomatic error handling using the `Result` type and the `?` operator.

## Components

The approach I took involves these components:

* An `enum` to define the available states.
* A trait that defines the transition from one state to the next.
* A state machine that iterates a slice of states and yields transitions.
* The `Request` and `Response` types for sharing data between states.

## Define the states

The `State` enum defines available states but does not encapsulate any data or indicate how states can transition:

```rs
#[derive(Debug, Eq, PartialEq, Copy, Clone)]
pub enum State {
    State1,
    State2,
    State3,
}
```

## Define the transition trait

The `Transition` trait is much more interesting as it defines how a state should move into another state:

```rs
/// Asynchronous fallible transition from a state
/// to the next state.
#[async_trait]
pub trait Transition {
    async fn next(
        &self,
        request: &Request,
        response: &mut Response,
    ) -> Result<Option<State>, Box<dyn std::error::Error>>;
}
```

When the state machine iterates it will yield a transition for each state and the caller then calls the transition which does the work before advancing to the next state which is determined by the return value of `next()`. When `next()` yields `None` the state machine should stop iterating. Note the use of the [async-trait][] attribute macro!

Conceptually, the `Request` type is a configuration object that can be used by states to determine how to transition, for example, if you need to skip some states under certain conditions. Whilst the `Response` type encapsulates data that can be passed to future states.

For the purposes of this example they are simple structs:

```rs
/// Mock configuration for the state machine.
#[derive(Debug, Default)]
pub struct Request {
    pub some_config: bool,
}

/// Mock response object that can capture intermediary state
/// to be passed to future transitions.
#[derive(Debug, Default)]
pub struct Response {
    pub some_data: usize,
}
```

The state machine itself is an `Iterator` implementation that yields a transition for a given state:

```rs
#[derive(Debug)]
pub struct StateMachine<'a> {
    states: &'a [State],
    index: usize,
}

impl<'a> StateMachine<'a> {
    pub fn new(states: &'a [State]) -> Self {
        Self { states, index: 0 }
    }

    /// Advance the index to the next state
    /// returned by a transition function.
    fn advance(&mut self, state: State) {
        let index = self.states.iter().position(|r| r == &state);
        if let Some(index) = index {
            self.index = index;
        } else {
            // Nowhere to go so prevent any more iteration.
            self.stop();
        }
    }

    /// Stop iteration by moving the state index out of bounds.
    fn stop(&mut self) {
        self.index = self.states.len()
    }
}

/// Iterator yields a transition for a state.
impl<'a> Iterator for StateMachine<'a> {
    type Item = (State, Box<dyn Transition>);
    fn next(&mut self) -> Option<Self::Item> {
        if let Some(state) = self.states.get(self.index) {
            let transition: Box<dyn Transition> = match state {
                State::State1 => Box::new(State1 {}),
                State::State2 => Box::new(State2 {}),
                State::State3 => Box::new(State3 {}),
            };
            Some((state.clone(), transition))
        } else {
            None
        }
    }
}
```

The state machine `Iterator` implementation is a straightforward mapping between a `State` and a `Transition`, we'll look at the `advance()` and `stop()` functions later when we come to iterate the state machine first let's implement a state transition:

```rs
struct State1;

#[async_trait]
impl Transition for State1 {
    async fn next(
        &self,
        request: &Request,
        response: &mut Response,
    ) -> Result<Option<State>, Box<dyn std::error::Error>> {
        if request.some_config {
            // Do something based on the request state
            // and advance past the next state
            Ok(Some(State::State3))
        } else {
            // Set some data on the response object that
            // can be used by a subsequent state
            response.some_data = 10;
            Ok(Some(State::State2))
        }
    }
}
```

Or a transition can just move on to the next state:

```rs
struct State2;

#[async_trait]
impl Transition for State2 {
    async fn next(
        &self,
        _request: &Request,
        response: &mut Response,
    ) -> Result<Option<State>, Box<dyn std::error::Error>> {
        debug!("State 2 got data {}", response.some_data);
        Ok(Some(State::State3))
    }
}
```

If there are no more states to process then the transition can return `None`:

```rs
struct State3;

#[async_trait]
impl Transition for State3 {
    async fn next(
        &self,
        _request: &Request,
        _response: &mut Response,
    ) -> Result<Option<State>, Box<dyn std::error::Error>> {
        Ok(None)
    }
}
```

Once the various components are defined we can iterate the state machine like this:

```rs
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    pretty_env_logger::init();

    let states = &[State::State1, State::State2, State::State3];

    let req: Request = Default::default();

    // Using this request will skip the second state
    //let req = Request { some_config: true };

    let mut res: Response = Default::default();
    let mut machine = StateMachine::new(states);
    while let Some((state, transition)) = machine.next() {
        debug!("Current state {:?}", state);
        let next_state = transition.next(&req, &mut res).await?;
        if let Some(state) = next_state {
            debug!("Advance state {:?}", state);
            machine.advance(state);
        } else {
            debug!("State machine completed");
            machine.stop();
        }
    }

    Ok(())
}
```

When a transition yields the next state we call `advance()` on the state machine so the iterator can jump to the index for the next state. It is important that the state exists in the list of states passed to the state machine otherwise `stop()` would be called which would halt execution.

If any of the transitions return an `Error` then iteration is immediately halted and the error is propagated to the caller.

{{import "footer"}}

[Rust]: https://www.rust-lang.org/
[state machine]:https://en.wikipedia.org/wiki/Finite-state_machine
[source code]: https://github.com/tmpfs/async-fsm-model
[main.rs]: https://github.com/tmpfs/async-fsm-model/blob/main/src/main.rs
[article]: https://hoverbear.org/blog/rust-state-machine-pattern/
[async-trait]: https://docs.rs/async-trait/0.1.42/async_trait/
