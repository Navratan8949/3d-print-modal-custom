"use client";

import { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { store } from "./index";
import { refreshSession, setIsLoaded } from "./authSlice";

function SessionInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Attempt silent session recovery using HttpOnly refresh cookie on application startup
    dispatch(refreshSession()).finally(() => {
      dispatch(setIsLoaded(true));
    });
  }, [dispatch]);

  return children;
}

export default function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <SessionInitializer>{children}</SessionInitializer>
    </Provider>
  );
}
