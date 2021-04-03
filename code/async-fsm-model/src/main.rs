extern crate pretty_env_logger;

use async_trait::async_trait;
use log::debug;

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

/// Enumeration of available states.
#[derive(Debug, Eq, PartialEq, Copy, Clone)]
pub enum State {
    State1,
    State2,
    State3,
}

/// State machine iterates available states and yields a
/// transition for each state.
///
/// Iterators should invoke the `next()` function on the yielded
/// transition to get the next state and then call `advance()` on
/// the state machine to jump to the next state.
///
/// The next state must exist in the list of iterable states
/// otherwise iteration is halted.
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

/// First mock state.
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

/// Second mock state.
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

/// Third mock state.
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

/// Execute the state machine transitions.
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
