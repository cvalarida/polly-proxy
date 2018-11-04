# Polly Proxy

Polly is a parrot. Once you teach her how to answer your requests, she'll faithfully parrot back what she knows.

## The modes

Polly Proxy can be run in two modes: Recording and Playback. Recording, as the name suggests, records responses to the requests passed through the proxy. Playback, predictably, plays the recorded responses back.

### Recording

To start out, we'll want to record some requests and responses.

```bash
polly --mode=recording
```

At this point, the server is started, so we need to route our traffic through it. Consult the documentation for your operating system to configure your HTTP proxy to pass the traffic through Polly Proxy.

Alternatively, if you don't want to set up a system-wide proxy rule, you can use a browser extension like FoxyProxy to route your traffic through Polly Proxy.

The records will be stored in the following directory structure:
```
records/
  GET/
    www.example.com/
      path/
        to/
          file
  POST/
```

Not sure how to differentiate two POST bodies yet.

### Playback

Once we have some responses recorded, we can stop the server and fire it up again in playback mode.

```bash
polly
```

We could specify `--mode=playback`, but it's the default mode, so we don't need to.
