module.exports = function (fn) {
  return (req, res, next) => {
    fn(req, res, next).catch(next); // catch(next) is shorthand for catch((err) => next(err))
  };
};

// to simplify our async controller functions with try/catch blocks. Here is function that returns NOT CALLED function with attached .catch, so it will be CALLED at right moment
