var express = require("express");
var router = express.Router();
var template = require("../models/template.js");
const loggedincheck = require("./middlewares.js");

router.get("", loggedincheck.isLoggedIn, function (req, res) {
  var title = "게시판";
  var html = template.HTML(
    title,
    `
    
    `
  );
});
