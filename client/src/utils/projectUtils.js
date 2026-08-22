/**
 * Project categorization helper utility.
 * 
 * Data Annotation and Infography projects require numeric task counts.
 * Other projects (e.g. Python Developer, SQL Developer, Web dev, custom projects)
 * do not need numeric task counts; they log normal messages and task details.
 */

export const isTaskCountRequired = (projectOrName) => {
  if (!projectOrName) return false;
  const name = typeof projectOrName === 'string'
    ? projectOrName
    : (projectOrName.name || projectOrName.code || '');
  
  const lower = name.trim().toLowerCase();
  return (
    lower.includes('annotation') ||
    lower.includes('infography') ||
    lower.includes('infographic')
  );
};

export const getProjectTypeLabel = (projectOrName) => {
  return isTaskCountRequired(projectOrName)
    ? 'Numeric Tasks'
    : 'Task Details / Message';
};