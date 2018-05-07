const neo4j = require("./Driver");

let neo = new neo4j("http://localhost:7474/", "neo4j", "neo4j");

neo.runCyphers(["CREATE (n:bog) RETURN n"], (err, nodes, rels) => {
        if(err){
            console.log(err);
        }else{
            console.log(nodes);
        }
});
