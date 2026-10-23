@JIRA-EPIC:HDPD-534 @regression @WIP

Feature: Verify Tenant Details Check Your Answers Page

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
        When I click "Who is on the tenancy" link
        Then I check that the text "Your information" is displayed on the page


    @AC1 @JIRA-TEST-KEY:PTSD-977
    Scenario: Verify tenant details Check your answers page content

        When I enter "ABC Limited" for the label "Company name (optional)"
        And I click "Save and continue"
        Then I check that the text "Check your answers" is displayed on the page
        And I check that the text "Tenant details" is displayed on the page
        


    @AC2 @JIRA-TEST-KEY:PTSD-978
    Scenario: Verify company name is displayed

        When I enter "ABC Limited" for the label "Company name (optional)"
        And I click "Save and continue"
        Then I check that the text "Check your answers" is displayed on the page
        And I check that the text "Tenant details" is displayed on the page
        Then the field "Company name (optional)" with value "ABC Limited" is "displayed"


    @AC3 @JIRA-TEST-KEY:PTSD-979
    Scenario: Verify reference number is displayed

        When I enter "REF12" for the label "Reference number for communication (optional)"
        And I click "Save and continue"
        Then I check that the text "Check your answers" is displayed on the page
        And I check that the text "Tenant details" is displayed on the page
        Then the field "Reference number for communication (optional)" with value "REF12" is "displayed"

    @AC4 @JIRA-TEST-KEY:PTSD-980
    Scenario: Verify optional fields are hidden when unanswered

        When I click "Save and continue"
        Then the field "Company name (optional)" is "not displayed"
        Then the field "Reference number for communication (optional)" is "not displayed"

    @AC5 @JIRA-TEST-KEY:PTSD-981

    Scenario: Verify change link updates answer

        When I click "Save and continue"
        When I click the change link for "First name"
        And I enter "David" for the label "First name"
        And I enter "John" for the label "Last name"
        And I click "Save and continue"
        Then the field "First name" with value "David" is "displayed"
        Then the field "Last name" with value "John" is "displayed"

    @AC6 @JIRA-TEST-KEY:PTSD-982
    Scenario: Verify complete this section

        When I click "Save and continue"
        And I click "Complete this section"
        Then I check that the text "Application for" is displayed on the page

    @AC7 @JIRA-TEST-KEY:PTSD-983
    Scenario: Verify save for later

        When I click "Save and continue"
        And I click "Save for later"
        Then I check that the text "Application for" is displayed on the page