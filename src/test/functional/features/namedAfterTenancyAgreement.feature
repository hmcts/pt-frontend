@JIRA-TEST-KEY:HDPD-1012 @regression @tenancy-agreement
Feature: Who is named on your tenancy agreement
    As a citizen starting an application
    I want to say whether I am a tenant or joint tenant
    So that I am sent to the correct application route

    Background:
        Given I am on the "Who is named on your tenancy agreement" page

    @JIRA-TEST-KEY:PTSD-759
    Scenario: Selecting Tenant takes the user to the IDAM login page
        When I select the option "Tenant" under "Are you a tenant or joint tenant?"
        And I click "Continue"
        Then user is taken to the IDAM login page

    @JIRA-TEST-KEY:PTSD-760
    Scenario Outline: Selecting Joint tenant or not sure takes the user to the use another form page
        When I select the option "<option>" under "Are you a tenant or joint tenant?"
        And I click "Continue"
        Then user is taken to "You need to use another form to apply" page
        When I click "Back" link
        Then user is taken back to "Who is named on your tenancy agreement" page

        Examples:
        | option       |
        | Joint tenant |
        | I'm not sure |