function isLogged(req, res, next) {
    if (req.isAuthenticated()) {
      next()
    } else {
      res.redirect('/auth/')
    }
  };
  
export default isLogged;