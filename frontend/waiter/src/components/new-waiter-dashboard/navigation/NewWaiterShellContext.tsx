'use client';

import React, { createContext, useContext } from 'react';

interface ShellContextValue {
  inShell: boolean;
}

const NewWaiterShellContext = createContext<ShellContextValue>({ inShell: false });

export const useNewWaiterShell = () => useContext(NewWaiterShellContext);

export default NewWaiterShellContext;
