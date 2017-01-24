# Title
ADR-001: Creating a new nodejs build tool.

# Date
01-24-2017

# Summary
This is a nodejs build tool that has the simplicity of gruntfiles and the flexibility of gulpfiles.

# Context
Gulpfiles are good, but provide little to no flow control or ability to run sub-module gulp builds. Gruntfiles allow for flow control, but the "config" type setup makes it difficult to layout in code.

# Decision
I will develop my own build tool that allows me to control the flow and sequence of the builds. It will also allow for addtional buildfiles to be loaded and run. The syntax will also be relatively easy to follow.

# Consequences
We will lose the familiarity and community of more common build tools like grunt, gulp, jake, and webpack.

# Status
Accepted