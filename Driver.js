const http = require("http");
const { URL } = require("url");

module.exports =  class Driver {
    constructor(url ,user, password){
        if(url){
            this.url = new URL(url);
        }
        this.user = "";
        this.password = "";
        if(typeof(user) === "string" && typeof(password) === "string"){
            this.user = user;
            this.password = password;
        }
        this.auth = new Buffer(`${this.user}:${this.password}`).toString("Base64"); 
    }
    changePassword(newPassword, callback){          //修改neo4j用户的密码; callback(error, Message)
        if(callback && typeof(callback) === "function"){
            let postData = {
                "password": ""
            }
            if(typeof(newPassword) === "string"){
                postData.password = newPassword;
            }
            let option = {
                protocol: this.url.protocol,
                hostname: this.url.hostname,
                method: "POST",
                port: this.url.port,
                path: `/user/neo4j/password`,
                headers: {
                    "Content-Type": "application/json",
                    "charset": "utf-8",
                    "Accept": "application/json",
                    "Authorization": this.auth
                }
            }
            const req = http.request(option, (res) => {
                if(res.statusCode == 200){
                    callback(null, `The result of Change_Password: ${res.statusMessage}`);
                }else{
                    callback(`${res.statusCode}: ${res.statusMessage}`);
                }
            });
            req.write(JSON.stringify(postData));
            req.on("error", (err) => {
                callback(err);
            });
            req.end();
        }
    }
    runCyphers(cyphers, callback){         //cyphyers为Array; callback(error, nodes, relationships)
        if(callback && typeof(callback) === "function"){
            let postData = {
                "statements":[]
            };
            if(Array.isArray(cyphers)){
                for(let i = 0; i < cyphers.length; i ++){
                    postData.statements.push({"statement": cyphers[i],"resultDataContents": ["graph"]});
                }
            }else{
                callback(new Error("cyphers must be a Array"));
            }
            let option = {
                protocol: this.url.protocol,
                hostname: this.url.hostname,
                port: this.url.port,
                path: `/db/data/transaction/commit`,
                method: "POST",
                headers:{
                    "Content-Type": "application/json",
                    "charset": "utf-8",
                    "Accept": "application/json",
                    "Authorization": this.auth
                }
            }
            const req = http.request(option, function(res){
                let data = "";
                res.on("data", (chunk) => {
                    data += chunk;
                });
                res.on("end", () => {
                    let nodes = [], relationships =[];
                    let json = JSON.parse(data);
                    for(let i = 0; i < json.results.length; i++){
                        for(let j = 0; j < json.results[i].data.length; j++){
                            for(let m = 0; m < json.results[i].data[j].graph.nodes.length; m++){
                                nodes.push(json.results[i].data[j].graph.nodes[m]);
                            }
                            for(let n = 0; n <json.results[i].data[j].graph.relationships.length; n++){
                                relationships.push(json.results[i].data[j].graph.relationships[n]);
                            }
                        }
                    }
                    callback(null, nodes, relationships);
                });
            });
            req.on("error", (err) => {
                callback(err);
            });
            req.write(JSON.stringify(postData));
            req.end();
        }
    }
}