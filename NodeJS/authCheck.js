module.exports = {
  isOwner: function (request, response) {
    if (request.session.is_logined) {
      return true;
    } else {
      return false;
    }
  },
  statusUI: function (req, res) {
    var authStatusUI = "로그인후 사용 가능합니다";
    if (this.isOwner(req, res)) {
      authStatusUI = `${req.session.nickname}님 환영합니다 | <a href="/auth/logout">로그아웃</a>`;
    }
    return authStatusUI;
  },
};
