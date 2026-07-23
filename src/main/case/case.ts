export interface Case {
  //TODO: build this out once data model added to pt-api
  firstName: string;
  lastName: string;
  applicationType: string;
  tenancyType: string;
}

export interface CaseWithId extends Case {
  id: string;
  state: string;
}
