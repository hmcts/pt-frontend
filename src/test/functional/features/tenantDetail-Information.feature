@JIRA-TEST-KEY:HDPD-531 @regression

Feature: Your information

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


    @AC1 @JIRA-TEST-KEY:PTSD-919 @AC2 @JIRA-TEST-KEY:PTSD-920
    Scenario: Verify First Name pre-population

        Then I check that the text "Your information" is displayed on the page
        Then the field "First name" is prepopulated with "pt"
        


    @AC3 @JIRA-TEST-KEY:PTSD-921
    Scenario: Verify Last Name pre-population

        Then I check that the text "Your information" is displayed on the page
        Then the field "Last name" is prepopulated with "citizen"


    @AC4 @JIRA-TEST-KEY:PTSD-922 @AC5 @JIRA-TEST-KEY:PTSD-923
    Scenario: Save and continue with valid mandatory fields

        When I click "Save and continue"
        Then I check that the text "Check your answers" is displayed on the page

    @AC6 @JIRA-TEST-KEY:PTSD-924
    Scenario: Mandatory field validation errors

        When I enter "" in "First name"
        And I enter "Smith" in "Last name"
        And I click "Save and continue"
        Then I check that the error message "Enter a first name" is displayed on the page

        When I enter "John" in "First name"
        And I enter "" in "Last name"
        And I click "Save and continue"
        Then I check that the error message "Enter a last name" is displayed on the page

        When I enter "John123" in "First name"
        And I enter "Smith" in "Last name"
        And I click "Save and continue"
        Then I check that the error message "First name must only include letters a to z, and special characters such as hyphens, spaces and apostrophes" is displayed on the page

        When I enter "John" in "First name"
        And I enter "Smith123" in "Last name"
        And I click "Save and continue"
        Then I check that the error message "Last name must only include letters a to z, and special characters such as hyphens, spaces and apostrophes" is displayed on the page


        When I enter "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" in "First name"
        And I enter "Smith" in "Last name"
        And I click "Save and continue"
        Then I check that the error message "First name must be 100 characters or less" is displayed on the page


        When I enter "John" in "First name"
        And I enter "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB" in "Last name"
        And I click "Save and continue"
        Then I check that the error message "Last name must be 100 characters or less" is displayed on the page