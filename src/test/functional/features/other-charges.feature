Feature: Other Charges description can be added
  As a user completing the form I want to add a description for other charges so that I can provide details when I am charged separately

Background: Other Charges page - User navigates to the other charges page
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
    And I select "Yes" for the question "Does the rent include any charges for utilities?"
    And I click "Save and continue"
    And I select "Monthly" for the question "How often are utilities paid? (optional)"
    And I enter "100" for the question "How much do all utilities cost in your property monthly? (optional)"
    And I click "Save and continue"
    And I enter the date "31/05/2025" for the question "When did your current tenancy start?"
    And I click "Save and continue"
    And I enter the date "31/05/2027" for the question "When does your tenancy end?"
    And I click "Save and continue"
    And I select "No" for the question "Does your current tenancy replace an original tenancy?"
    And I click "Save and continue"

  @JIRA-TEST-KEY:PTSD-850
  Scenario: Other Charges page - Successfully add other charge description and see remaining characters are displayed
    When I select "Yes" for the question "Are you charged separately for anything else?"
    And I click "Save and continue"
    And I add other charge details in description as "Charged for monthy house maintenance"
    Then I check that the text "You have 464 characters remaining" is displayed on the page
    And I click "Save and continue"

  @JIRA-TEST-KEY:PTSD-853
  Scenario: Other Charges page - Description exceeds 500 characters shows validation error
    When I select "Yes" for the question "Are you charged separately for anything else?"
    And I click "Save and continue"
    And I enter characters more than 500 in the description field
    And I click "Save and continue"
    Then I check that the error message "Description of what you are charged separately for must be 500 characters or less" is displayed on the page  