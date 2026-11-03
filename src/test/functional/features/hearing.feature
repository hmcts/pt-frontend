
@JIRA-EPIC:HDPD-1050 @regression
Feature: Validate  Review and manage hearing information Page

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
        When I click "Tell us if you think an inspection, a hearing, or both are needed" link
        And I select "Yes" for the question "Do you agree to the tribunal making a decision without an inspection?"
        And I click "Save and continue"
        Then I check that the text "Hearing" is displayed on the page



    @AC1 @JIRA-TEST-KEY:PTSD-871
    Scenario: Verify page content on the Hearing Details page

        Then I check that the text "The tribunal will usually make its decision based on the documents and evidence provided by you and the landlord." is displayed on the page
        And I check that the text "Only ask for a hearing if you want to attend a tribunal to add to the documents and evidence you have provided. The tribunal will consider all documents and evidence with or without a hearing." is displayed on the page
        And I check that the text "The tribunal will decide if a hearing is needed." is displayed on the page

    @AC2 @JIRA-TEST-KEY:PTSD-872
    Scenario: Verify reason field is displayed when Yes is selected

        When I select "Yes" for the question "Do you want a hearing?"
        Then I check that the text "Tell us why you think a hearing is needed" is displayed on the page

    @AC3 @JIRA-TEST-KEY:PTSD-873
    Scenario: Verify citizen can continue when No is selected

        When I select "No" for the question "Do you want a hearing?"
        And  I click "Save and continue"
        Then I check that the text "Check your answers" is displayed on the page

    @AC4 @JIRA-TEST-KEY:PTSD-873
    Scenario: Verify citizen can continue when Yes is selected with a reason

        When I select "Yes" for the question "Do you want a hearing?"
        And I enter "Hearing detail is provided" for the question "Tell us why you think a hearing is needed"
        And I click "Save and continue"
        Then I check that the text "Check your answers" is displayed on the page


    @AC5 @JIRA-TEST-KEY:PTSD-874
    Scenario: Verify validation when no option is selected

        When I click "Save and continue"
        Then I check that the error message "Select yes if you want a hearing" is displayed on the page

    @AC6 @JIRA-TEST-KEY:PTSD-874
    Scenario: Verify validation when Yes is selected without a reason

        When I select "Yes" for the question "Do you want a hearing?"
        And I click "Save and continue"
        Then I check that the error message "Enter why you think a hearing is needed" is displayed on the page