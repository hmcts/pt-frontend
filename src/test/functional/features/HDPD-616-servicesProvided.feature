@JIRA-EPIC:HDPD-616
Feature: Are any services provided in your tenancy


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

    @AC1 @JIRA-TEST-KEY:PTSD-786
    Scenario: Verify services provided page content
        Given the citizen is on the Services Provided page
        Then the services page displays all expected content

    @AC2 @JIRA-TEST-KEY:PTSD-787
    Scenario: Verify services details textarea is displayed when Yes is selected
        Given the citizen is on the Services Provided page
        When the citizen selects services Yes
        Then the services details textarea is displayed

    @AC3 @JIRA-TEST-KEY:PTSD-787
    Scenario: Verify Save and Continue with Yes selected
        Given the citizen is on the Services Provided page
        When the citizen selects services Yes
        And the citizen enters services details
        And the citizen clicks services Save and continue
        Then the citizen is navigated to the What repairs are the landlord responsibility page

    @AC4 @JIRA-TEST-KEY:PTSD-788
    Scenario: Verify Save and Continue with No selected
        Given the citizen is on the Services Provided page
        When the citizen selects services No
        And the citizen clicks services Save and continue
        Then the citizen is navigated to the What repairs are the landlord responsibility page

    @AC5 @JIRA-TEST-KEY:PTSD-789
    Scenario: Verify Save for Later from Services Provided page
        Given the citizen is on the Services Provided page
        When the citizen selects services Yes
        And the citizen enters services details
        And the citizen clicks services Save for later
        Then check that the user is redirected to the task-list citizen dashboard page

    @AC6 @JIRA-TEST-KEY:PTSD-790
    Scenario: Verify validation when no services option is selected
        Given the citizen is on the Services Provided page
        When the citizen clicks services Save and continue
        Then the citizen sees the services radio button validation error

    @AC7 @JIRA-TEST-KEY:PTSD-790
    Scenario: Verify validation when services details are blank
        Given the citizen is on the Services Provided page
        When the citizen selects services Yes
        And the citizen clicks services Save and continue
        Then the citizen sees the services mandatory details validation error

    @AC7 @JIRA-TEST-KEY:PTSD-790
    Scenario: Verify validation when services details are below minimum length
        Given the citizen is on the Services Provided page
        When the citizen selects services Yes
        And the citizen enters invalid services details
        And the citizen clicks services Save and continue
        Then the citizen sees the services minimum length validation error