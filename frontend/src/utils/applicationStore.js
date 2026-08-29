export function getApplicationsKey(userId) {
  return userId ? `jansahay_applications_${userId}` : 'jansahay_applications_guest';
}

export function getApplications(userId) {
  try {
    const key = getApplicationsKey(userId);
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function getApplication(applicationId, userId) {
  return getApplications(userId).find((application) => application.id === applicationId) || null;
}

export function saveApplication(application, userId) {
  const key = getApplicationsKey(userId);
  const applications = getApplications(userId);
  localStorage.setItem(key, JSON.stringify([application, ...applications]));
  return application;
}

export function createSyntheticApplication({ scheme, applicant, documentChecks }) {
  const year = new Date().getFullYear();
  const suffix = String(Math.floor(100000 + Math.random() * 900000));
  const id = `JS-${year}-${suffix}`;

  return {
    id,
    scheme: {
      slug: scheme.slug,
      name: scheme.name,
      category: scheme.category,
      portal: scheme.portal,
      applicationUrl: scheme.application_url || scheme.applicationUrl,
    },
    applicant,
    documentChecks,
    status: 'Submitted',
    createdAt: new Date().toISOString(),
    isSynthetic: true,
  };
}
