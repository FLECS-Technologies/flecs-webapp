import { createContext, useState } from "react";

//const [appList, setAppList] = useState(undefined);

//const ReferenceDataContext = createContext({ appList, setAppList });

export const ReferenceDataContext = createContext([]);

export const ReferenceDataContextProvider = ({ children }) => {
  const [appList, setAppList] = useState(undefined);
  return (
    <ReferenceDataContext.Provider value={{ appList, setAppList }}>
      {children}
    </ReferenceDataContext.Provider>
  );
};

//export { ReferenceDataContext, ReferenceDataContextProvider };