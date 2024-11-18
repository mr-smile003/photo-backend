const wrapResponse = (res, status, data = null, message = '') => {
  const response = {
    success: status >= 200 && status < 300,
    data: data,
    message: message
  };

  return res.status(status).json(response);
};

export const successResponse = (res, data = null, message = 'Operation successful') => {
  return wrapResponse(res, 200, data, message);
};

export const createdResponse = (res, data = null, message = 'Resource created successfully') => {
  return wrapResponse(res, 201, data, message);
};

export const errorResponse = (res, message = 'Operation failed', status = 500) => {
  return wrapResponse(res, status, null, message);
};

export const notFoundResponse = (res, message = 'Resource not found') => {
  return wrapResponse(res, 404, null, message);
};

export const unauthorizedResponse = (res, message = 'Unauthorized access') => {
  return wrapResponse(res, 401, null, message);
};
