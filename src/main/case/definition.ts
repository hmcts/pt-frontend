export interface CaseData {
  //TODO: build this out once data model added to pt-api
  firstName: string;
  lastName: string;
  applicationType: string;
  tenancyType: string;
}

export const CITIZEN_CREATE_CASE = 'citizen-create-application';
export const CITIZEN_UPDATE_CASE = 'citizen-update-application';
export const CITIZEN_SUBMIT_CASE = 'citizen-submit-application';
