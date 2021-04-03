+++
created = 2021-04-03
title = "Process Supervisor Library"
description = "Designing a process supervisor library"

[taxonomies]
tags = ["Rust", "Command", "Process", "Supervisor"]
+++

{{import "header"}}

I recently needed to design a [Rust][] library for managing child processes and facilitating bi-directional communication between child processes and the parent &#8212; a process supervisor. If you want to jump straight to the implementation [source code][] go right ahead.

Neither threads nor green threads are appropriate for the job as the program ships a compiler which allows version pinning similar to tools such as [rbenv][]; the parent process needed to spawn a child *compiler process* to ensure the pinned compiler version for each project was respected.

The child process needed to pass information to the parent such as connection information for a local web server (which required support for ephemeral ports so that multiple processes could run simultaneously) and later we wanted to pass compiler errors back to the parent for error reporting.

There are various ways to do the Inter-Process Communication (IPC) but usually UNIX sockets and named pipes on Windows are preferred as tried and tested methods. We wanted to target all three major desktop platforms so like any decent engineer I went looking for an existing library first and came across [interprocess][] which looked very promising.

The trouble I had was that once I took a nonblocking [LocalSocketStream][] and split it into it's `Read` and `Write` pair writing to the socket would block the read loop which meant I could not get full duplex communication over each socket. I spent quite a while trying to figure out my error but the code looked valid and sound so I decided to try something different.

I switched out [interprocess][] for a [UnixStream][] and immediately the code worked! I now had full duplex communication between the processes but had lost Windows named pipe support.

Our program aims to support Windows in the future and we have a sprint planned to compile, test, fix and iterate for a Windows build so the decision was made to roll our own process supervisor using [UnixStream][] and add named pipe support later for Windows.

It was a shame that [interprocess][] did not work out and I suspect it was to do with their implementation being decoupled from [tokio][] and using the futures traits directly but didn't want to go down the rabbit hole trying to fix the bug because this task was already quite a tangent from our current goal - a graphical user interface.

Now that duplex communication was working it was quite easy to design a simple process supervisor that communicated via a [UnixStream][]; see the [psup-impl][] documentation for usage details.

The design supports *daemon* operation so workers that died would be restarted by the parent process (upto a retry limit) for child processes that should always be running and includes a communication channel to spawn and kill worker processes; most of the logic can be found in [supervisor.rs][].

Our program was already making use of [JSON-RPC][] in various places so it made sense to use it for the IPC communication too. We added a helper library [psup-json-rpc][] which meant each side of the channel could easily map JSON packets to method calls.

If you spot a mistake or want to suggest an improvement [[contact|get in touch]] and let me know.

{{import "footer"}}

[Rust]: https://www.rust-lang.org/
[source code]: https://github.com/tmpfs/psup/
[psup-impl]: https://docs.rs/psup-impl/
[psup-json-rpc]: https://docs.rs/psup-json-rpc/
[supervisor.rs]: https://github.com/tmpfs/psup/blob/main/impl/src/supervisor.rs
[interprocess]: https://docs.rs/interprocess/
[LocalSocketStream]: https://docs.rs/interprocess/1.1.1/interprocess/nonblocking/local_socket/struct.LocalSocketStream.html
[tokio]: https://docs.rs/tokio/1.4.0/tokio/
[UnixStream]: https://docs.rs/tokio/1.4.0/tokio/net/struct.UnixStream.html
[JSON-RPC]: https://www.jsonrpc.org/
[rbenv]: https://github.com/rbenv/rbenv
