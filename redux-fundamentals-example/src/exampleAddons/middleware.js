// アロー関数は、Middleware(storeAPI) > wrapDispatch(next) > handleAction(action)と関数をネストしている
// なので最初の関数の引数にはdispatchとgetStateが含まれるstoreAPIオブジェクトが渡されるがサンプルでは利用していないので省略している
export const print1 = () => next => action => {
  console.log('1');
  return next(action);
};

export const print2 = () => next => action => {
  console.log('2');
  return next(action);
};

export const print3 = () => next => action => {
  console.log('3');
  return next(action);
};
