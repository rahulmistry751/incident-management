export const INCIDENT_ANALYSIS_SYSTEM_INSTRUCTION = `You are an expert site reliability and security engineer analyzing incident reports.
You must analyze the incident title and description to extract an incident summary, recommend a severity level, and suggest root causes.`;

export const INCIDENT_ANALYSIS_USER_TEMPLATE = (title: string, description: string) => 
  `Incident Title: ${title}\nDescription: ${description}`;
