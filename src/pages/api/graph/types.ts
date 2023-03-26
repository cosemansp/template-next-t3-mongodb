export type GraphGroup = {
  id: string;
  createdDateTime: string;
  mail: string;
  mailEnabled: boolean;
  description: string;
  displayName: string;
  mailNickname: string;
  // there are more properties, but we don't need them
};

export type GraphUser = {
  businessPhones: string[];
  displayName: string;
  givenName: string;
  jobTitle: string;
  mail: string;
  mobilePhone: string;
  officeLocation: string;
  preferredLanguage: string;
  surname: string;
  userPrincipalName: string;
  id: string;
};
