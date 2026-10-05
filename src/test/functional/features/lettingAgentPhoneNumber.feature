@JIRA-EPIC:HDPD-1004 @regression

Feature: Validate Letting Agent Phone Number Page

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

    @AC1 @JIRA-TEST-KEY:PTSD-875
    Scenario: Verify page content on letting agent phone number page
        Given the citizen is on the letting agent's phone number page

    @AC2 @JIRA-TEST-KEY:PTSD-876
    Scenario Outline: Verify citizen can continue with valid phone number or blank value
        Given the citizen is on the letting agent's phone number page
        When the citizen enters "<phoneNumber>" in the phone number field
        And I click "Save and continue"
        Then the citizen is redirected to "<page>"


        Examples:
            | phoneNumber | page                                  |
            | 07890123456 | Check your answers - Landlord details |

    @AC3 @JIRA-TEST-KEY:PTSD-877
    Scenario Outline: Verify validation for invalid phone numbers
        Given the citizen is on the letting agent's phone number page
        When the citizen enters "<phoneNumber>" in the phone number field
        And I click "Save and continue"
        Then I check that the error message "Enter a phone number in the correct format, including the country code for international numbers" is displayed on the page


        Examples:
            | phoneNumber |
            | abc123      |
            | test@test   |
            | 123#456     |
            | 07*90012345 |
            | phone123    |