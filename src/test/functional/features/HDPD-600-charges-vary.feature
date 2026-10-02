@JIRA-EPIC:HDPD-600 @regression

Feature: Validate Do the charges you pay for these services vary? Page

    Background:
        Given the user navigates to PT url
        And the user has successfully logged on to market-rent-determination application
        When user clicks on the my application link
        Then check that the user is redirected to the application-type page
        And I select the option "Challenge my rent as excessive within the first 6 months of the tenancy"
        And I click "Continue"
        Then check that the user is redirected to the "tenancy-type" page
        And I select the option "Assured periodic tenancy"
        And I click "Continue"
        Then check that the user is redirected to the task-list citizen dashboard page
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
        And I select "Yes" for the question "Are you charged separately for anything else?"
        And I click "Save and continue"
        And I click "Save and continue"

    @AC1 @JIRA-TEST-KEY:PTSD-831
    Scenario: Verify page load content
        Given the citizen is on the Charges Vary page
        Then the citizen sees the page heading
        And the citizen sees the hint text

    @AC2 @JIRA-TEST-KEY:PTSD-832
    Scenario: Verify conditional reveal when Yes is selected
        Given the citizen is on the Charges Vary page
        When I select "Yes" for the question "Do the charges you pay for these services vary?"
        Then the variation details text area is displayed

    @AC3 @JIRA-TEST-KEY:PTSD-834
    Scenario: Verify save and continue with Yes and details
        Given the citizen is on the Charges Vary page
        When I select "Yes" for the question "Do the charges you pay for these services vary?"
        And the citizen enters charges variation details
        And I click "Save and continue"
        Then the citizen is navigated to the next page

    @AC4 @JIRA-TEST-KEY:PTSD-835
    Scenario: Verify save and continue with No selected
        Given the citizen is on the Charges Vary page
        When I select "No" for the question "Do the charges you pay for these services vary?"
        And I click "Save and continue"
        Then the citizen is navigated to the next page

    @AC5 @JIRA-TEST-KEY:PTSD-836
    Scenario: Verify Save for Later
        Given the citizen is on the Charges Vary page
        When I select "Yes" for the question "Do the charges you pay for these services vary?"
        And the citizen enters charges variation details
        And I click "Save for later"
        Then check that the user is redirected to the task-list citizen dashboard page

    @AC6 @JIRA-TEST-KEY:PTSD-837
    Scenario: Verify validation when no radio option selected
        Given the citizen is on the Charges Vary page
        And I click "Save and continue"
        Then I check that the error message "Select whether the charges you pay for these services vary" is displayed on the page

    @AC7 @JIRA-TEST-KEY:PTSD-837
    Scenario: Verify validation when Yes selected and details blank
        Given the citizen is on the Charges Vary page
        When I select "Yes" for the question "Do the charges you pay for these services vary?"
        And the citizen leaves the variation details blank
        And I click "Save and continue"
        Then I check that the error message "Enter how the charges you pay vary" is displayed on the page

    @AC8 @JIRA-TEST-KEY:PTSD-837
    Scenario: Verify validation when more than 500 characters entered
        Given the citizen is on the Charges Vary page
        When I select "Yes" for the question "Do the charges you pay for these services vary?"
        And the citizen enters more than 500 characters
        And I click "Save and continue"
        Then I check that the error message "How the charges you pay vary must be 500 characters or less" is displayed on the page