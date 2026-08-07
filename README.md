# App UI

Produktor front-end static application based on angular and material design and to be hosted on github to be view over  CDN's like github.io etc.

## Requirements

* Angular
* TypeScript


```yaml
title: About Front Matter
language: yaml
```

+++
title = "About Front Matter"
[example]
language = "toml"
+++

~"feature request"


```mermaid
graph TB

  subgraph "SubGraph 1 Flow"
  SubGraph1 --> SubGraph1Flow
  SubGraph1Flow(SubNode 1)
  SubGraph1Flow -- Choice1 --> DoChoice1
  SubGraph1Flow -- Choice2 --> DoChoice2
  end 

  subgraph "Main Graph"
  Node1[Node 1] --> Node2[Node 2]
  Node2 --> SubGraph1[Jump to SubGraph1]
  SubGraph1 --> FinalThing[Final Thing]
end
```
