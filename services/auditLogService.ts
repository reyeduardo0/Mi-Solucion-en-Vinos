import { AuditLog } from '../types';

const AUDIT_LOG_KEY = 'miSolucionVinos_auditLog';

export const getAuditLogsFromStorage = (): AuditLog[] => {
    try {
        const logsJson = localStorage.getItem(AUDIT_LOG_KEY);
        return logsJson ? JSON.parse(logsJson) : [];
    } catch (error) {
        console.error("Error reading audit logs from localStorage", error);
        return [];
    }
};

export const saveAuditLogsToStorage = (logs: AuditLog[]): void => {
    try {
        const logsJson = JSON.stringify(logs);
        localStorage.setItem(AUDIT_LOG_KEY, logsJson);
    } catch (error) {
        console.error("Error saving audit logs to localStorage", error);
    }
};