# node-neo4j-driver
A neo4j driver for nodejs using HTTP API.
HTTP API

class
    Driver
    constructor(url, user, password),

methods
    changePassword(newPassword, callback(error, message));
    runCyphers(cyphers, callback(error, nodes, relationships));
        (cyphers must be a Array.)
