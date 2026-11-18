@JIRA-TEST-KEY:HDPD-1253 @regression

Feature: Validate Check the Property Details page

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
        When I click "Property details" link
        And I enter "100" for the question "Address line 1"
        And I enter "Test Street" for the question "Address line 2 (optional)"
        And I enter "London" for the question "Town or city"
        And I enter "E1 1AA" for the question "Postcode"
        And I click "Save for later"
        And check that the user is redirected to the task-list citizen dashboard page
        When I navigate to landlord response property-address page
        Then I check that the text "Check the property details" is displayed on the page



    @AC1 @JIRA-TEST-KEY:PTSD-1052
    Scenario: Verify page content
        And I check that the text "Has the tenant provided the correct address of the property?" is displayed on the page
        And I check that the text "Address" is displayed on the page

    @AC2 @JIRA-TEST-KEY:PTSD-1052
    Scenario: Verify tenant property address is displayed correctly
        And I check that the text "100" is displayed on the page
        And I check that the text "Test Street" is displayed on the page
        And I check that the text "London" is displayed on the page
        And I check that the text "E1 1AA" is displayed on the page


    @AC3 @JIRA-TEST-KEY:PTSD-1053
    Scenario: Save and continue with Yes selection
        When I select "Yes" for the question "Has the tenant provided the correct address of the property?"
        And I click "Save and continue"
        Then I check that the text "Landlord type" is displayed on the page

    @AC4 @JIRA-TEST-KEY:PTSD-1054
    Scenario: Verify conditional reveal for No option
        When I select "No" for the question "Has the tenant provided the correct address of the property?"
        Then I check that the text "Enter the correct address of the property" is displayed on the page

    @AC5 @JIRA-TEST-KEY:PTSD-1055
    Scenario: Save with valid mandatory and optional address fields
        When I select "No" for the question "Has the tenant provided the correct address of the property?"
        And I enter "100" for the question "Address line 1"
        And I enter "Test Street" for the question "Address line 2 (optional)"
        And I enter "London" for the question "Town or city"
        And I enter "E1 1AA" for the question "Postcode"
        And I click "Save and continue"
        Then I check that the text "Landlord type" is displayed on the page

    @AC6 @JIRA-TEST-KEY:PTSD-1056
    Scenario: Save with mandatory fields only
        When I select "No" for the question "Has the tenant provided the correct address of the property?"
        And I enter "100" for the question "Address line 1"
        And I enter "London" for the question "Town or city"
        And I enter "E1 1AA" for the question "Postcode"
        And I click "Save and continue"
        Then I check that the text "Landlord type" is displayed on the page

    @AC7 @JIRA-TEST-KEY:PTSD-1057
    Scenario: Switching between options clears previous values
        When I select "No" for the question "Has the tenant provided the correct address of the property?"
        And I enter "100" for the question "Address line 1"
        And I enter "London" for the question "Town or city"
        And I enter "E1 1AA" for the question "Postcode"
        And I select "Yes" for the question "Has the tenant provided the correct address of the property?"
        And I click "Save and continue"
        Then I check that the text "Landlord type" is displayed on the page

    @AC8 @JIRA-TEST-KEY:PTSD-1058
    Scenario: Mandatory validation errors

        When I click "Save and continue"
        Then I check that the error message "Select whether the tenant has provided the correct address of the property" is displayed on the page
        When I select "No" for the question "Has the tenant provided the correct address of the property?"
        And I click "Save and continue"
        Then I check that the error message "Enter address line 1, typically the building and street" is displayed on the page
        Then I check that the error message "Enter town or city" is displayed on the page
        Then I check that the error message "Enter postcode" is displayed on the page
        When I enter "s" for the question "Address line 1"
        And I enter "l" for the question "Town or city"
        And I enter "S" for the question "Postcode"
        And I enter "f" for the question "Address line 2 (optional)"
        And I enter "d" for the question "County (optional)"
        And I click "Save and continue"
        Then I check that the error message "Address line 1 must be 2 characters or more" is displayed on the page
        Then I check that the error message "Address line 2 must be 2 characters or more" is displayed on the page
        Then I check that the error message "Town or city must be 2 characters or more" is displayed on the page
        Then I check that the error message "County must be 2 characters or more" is displayed on the page
        Then I check that the error message "Enter a full UK postcode" is displayed on the page


    @AC9 @JIRA-TEST-KEY:PTSD-1058
    Scenario: Invalid postcode validation
        When I select "No" for the question "Has the tenant provided the correct address of the property?"
        And I enter "12345" for the question "Postcode"
        And I click "Save and continue"
        Then I check that the error message "Enter a full UK postcode" is displayed on the page

    @AC10 @JIRA-TEST-KEY:PTSD-1059
    Scenario: Save for later
        When I select "No" for the question "Has the tenant provided the correct address of the property?"
        And I enter "100" for the question "Address line 1"
        And I click "Save for later"
        Then I check that the error message "Case overview" is displayed on the page

    @AC11 @JIRA-TEST-KEY:PTSD-1060
    Scenario: Verify back link

        When  I click "Back"
        Then I check that the text "Respond to the tenant's application" is displayed on the page