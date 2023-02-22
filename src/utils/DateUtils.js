export const StringToISO = (dateString) => {
  // Create a new Date object from the local time string
  const localDate = new Date(dateString);

  // Convert the local time to UTC
  const utcDate = localDate;

  // Set the time to midnight UTC
  utcDate.setUTCHours(0, 0, 0, 0);

  // Output the result as an ISO string
  const result = utcDate.toISOString();

  return result;
};
