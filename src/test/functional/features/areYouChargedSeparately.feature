@JIRA-EPIC:HDPD-599 @regression

Feature: Validate Are you charged separately for anything else? Page

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
        Then I check that the text "Are you charged separately for anything else?" is displayed on the page

    @AC1 @JIRA-TEST-KEY:PTSD-838
    Scenario: Page content

        Then I check that the text "Such as maintenance, repairs, management costs, or something else" is displayed on the page

    @AC2 @JIRA-TEST-KEY:PTSD-839
    Scenario: Save and continue with Yes selected

        When I select "Yes" for the question "Are you charged separately for anything else?"
        And I click "Save and continue"
        Then I check that the text "Other charges (optional)" is displayed on the page

    @AC3 @JIRA-TEST-KEY:PTSD-840
    Scenario: Save and continue with No selected

        When I select "No" for the question "Are you charged separately for anything else?"
        And I click "Save and continue"
        Then I check that the text "Check your answers" is displayed on the page

    @AC4 @JIRA-TEST-KEY:PTSD-841
    Scenario: Validation error

        When I click "Save and continue"
        Then I check that the error message "Select whether you are charged separately for anything else" is displayed on the page