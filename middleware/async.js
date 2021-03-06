exports.asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next).catch(next));

exports.passportAsyncHandler = (fn) => (
  accessToken,
  refreshToken,
  profile,
  done
) => Promise.resolve(fn(accessToken, refreshToken, profile, done).catch(done));
