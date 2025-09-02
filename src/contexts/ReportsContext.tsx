import React, {createContext, useContext, ReactNode} from 'react';

type ReportsContextType = {
  markReportAsRead: (reportId: string) => void;
  markReportAsOpened: (reportId: string) => void;
  openedReports: any[];
};

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

export const useReportsContext = () => {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReportsContext must be used within a ReportsProvider');
  }
  return context;
};

type ReportsProviderProps = {
  children: ReactNode;
  markReportAsRead: (reportId: string) => void;
  markReportAsOpened: (reportId: string) => void;
  openedReports: any[];
};

export const ReportsProvider: React.FC<ReportsProviderProps> = ({
  children,
  markReportAsRead,
  markReportAsOpened,
  openedReports,
}) => {
  return (
    <ReportsContext.Provider
      value={{markReportAsRead, markReportAsOpened, openedReports}}>
      {children}
    </ReportsContext.Provider>
  );
};
