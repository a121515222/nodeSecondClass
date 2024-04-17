require("dotenv").config();
const { Post } = require("./Modal/post");
const http = require("http");
const mongoose = require("mongoose");
const url = process.env.URL;

mongoose.connect(url).then(() => console.log("資料庫連接成功"));
// schema 開始

// schema 結束
const requestListener = async (req, res) => {
  const headers = {
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, Content-Length, X-Requested-With",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "PATCH, POST, GET,OPTIONS,DELETE",
    "Content-Type": "application/json",
  };
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });

  if (req.url == "/posts" && req.method == "GET") {
    const post = await Post.find();
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: "success",
        post,
      })
    );
    res.end();
  } else if (req.url == "/posts" && req.method == "POST") {
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        if (data.content !== undefined) {
          const newPost = await Post.create({
            name: data.name,
            content: data.content,
          });
          res.writeHead(200, headers);
          res.write(
            JSON.stringify({
              status: "success",
              data: newPost,
            })
          );
          res.end();
        } else {
          res.writeHead(400, headers);
          res.write(
            JSON.stringify({
              status: "false",
              message: "欄位未填寫正確，或無此 todo ID",
            })
          );
          res.end();
        }
      } catch (error) {
        res.writeHead(400, headers);
        res.write(
          JSON.stringify({
            status: "false",
            message: error,
          })
        );
        res.end();
      }
    });
  } else if (req.url.startsWith("/posts/") && req.method === "DELETE") {
    const id = req.url.split("/").pop();
    await Post.findByIdAndDelete(id);
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: "success",
        data: null,
      })
    );
    res.end();
  } else if (req.url.startsWith("/posts/") && req.method === "PUT") {
    const id = req.url.split("/").pop();
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        if (data.content !== undefined) {
          const newPost = await Post.findByIdAndUpdate(id, data, { new: true });
          console.log("newPost", newPost);
          res.writeHead(200, headers);
          res.write(
            JSON.stringify({
              status: "success",
              data: newPost,
            })
          );
          res.end();
        } else {
          res.writeHead(400, headers);
          res.write(
            JSON.stringify({
              status: "false",
              message: "欄位未填寫正確，或無此 todo ID",
            })
          );
          res.end();
        }
      } catch (error) {
        res.writeHead(400, headers);
        res.write(
          JSON.stringify({
            status: "false",
            message: error,
          })
        );
        res.end();
      }
    });
  } else if (req.method == "OPTIONS") {
    res.writeHead(200, headers);
    res.end();
  } else {
    res.writeHead(404, headers);
    res.write(
      JSON.stringify({
        status: "false",
        message: "無此網站路由",
      })
    );
    res.end();
  }
};
const server = http.createServer(requestListener);
server.listen(3000);
