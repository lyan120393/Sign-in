// Local Storage
const saveToLocal = (localKey, content) => {
  localStorage.setItem(localKey, JSON.stringify(content));
};

const getFromLocal = localKey => {
  return localStorage.getItem(localKey);
};

const removeFromLocal = localKey => {
  localStorage.removeItem(localKey);
};

const clearLocal = localKey => {
  localStorage.clear(localKey);
};
