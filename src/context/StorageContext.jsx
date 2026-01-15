import React, { createContext, useContext, useState } from 'react';

const StorageContext = createContext();

export const StorageProvider = ({ children }) => {
    const [storage, setStorage] = useState({});

    const addItem = (key, value) => {
        setStorage(prev => ({ ...prev, [key]: value }));
    };

    const getItem = key => storage[key];

    return (
        <StorageContext.Provider value={{ addItem, getItem }}>
            {children}
        </StorageContext.Provider>
    );
};

export const useStorage = () => {
    return useContext(StorageContext);
};
