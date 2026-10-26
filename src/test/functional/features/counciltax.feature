@JIRA-TEST-KEY:HDPD-593 @regression
Feature: Council tax details can be added and updated
  As a PT user completing the form
  I want to enter and update council tax information
  So that the correct amount is recorded as part of the current rent and other costs

  @JIRA-TEST-KEY:PTSD-850
  Scenario: Council Tax page - Check that council tax details can be added and saved for later
    Given the user navigates to PT url
    And the user has successfully logged on to market-rent-determination application
    Then check that the user is redirected to the my-application page
    When user clicks on the my application link
    Then check that the user is redirected to the application-type page
    And I select the option "Challenge my rent as excessive within the first 6 months of the tenancy"
    And I click "Continue"
    Then check that the user is redirected to the "tenancy-type" page
    And I select the option "Assured periodic tenancy"
    And I click "Continue"
    And I click "The current rent and other costs"
    And I select "Yes" for the question "Has the tribunal previously determined the rent for your tenancy?"
    And I enter "LON/00AD/SMO/2023/0002" for the question "What was the tribunal's case reference number for the previous determination? (optional)"
    And I click "Save and continue"
    And I select "Monthly" for the question "How often do you pay your rent?"
    And I enter "1000" for the question "How much is the current monthly rent?"
    And I click "Save and continue"
    And I select "Yes" for the question "Does your rent include council tax?"
    And I click "Save and continue"
    And I select "Monthly" for the question "How often is council tax paid? (optional)"
    And I enter "100" for the question "How much does council tax cost monthly? (optional)"
    And I click "Save and continue"
    And I select "Yes" for the question "Does the rent include any charges for utilities"
    And I click back link
    And I enter "200" for the question "How much does council tax cost monthly? (optional)"
    And I click "Save and continue"
    And I click "Save for later"
    Then check that the user is redirected to the task-list citizen dashboard page