@JIRA-EPIC:HDPD-616 @regression @WIP

Feature: Validate Are any services provided in your tenancy page


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
        Then check that the user is redirected to the property-details page
        And I enter first line of address as "100"
        And I enter second line of address as "Test Street"
        And I enter town or city as "London"
        And I enter postcode as "E1 1AA"
        And I click "Save and continue"
        When I select "Fully detached house" for the question "What are you renting?"
        And I click "Save and continue"
        When I select "No" for the question "Do you have a floor plan of the property?"
        And I enter room sizes as "Room 1: 10x10, Room 2: 12x12" for the question "Tell us the number and type of rooms, and their sizes (optional)"
        And I click "Save and continue"
        And I click "Save and continue"
        When I select "No" for the question "Does the tenancy include any other facilities?"
        And I click "Save and continue"
        When I select "No" for the question "Do you share the property with your landlord?"
        And I click "Save and continue"
        And I click "Save and continue"
        And I click "Save and continue"
        And I select "No" for the question "Is furniture provided in your tenancy?"
        And I click "Save and continue"
        Then I check that the text "Are any services provided in your tenancy?" is displayed on the page

    @AC1 @JIRA-TEST-KEY:PTSD-786
    Scenario: Verify services provided page content

        Then I check that the text "For example, cleaning or gardening" is displayed on the page

    @AC2 @JIRA-TEST-KEY:PTSD-787
    Scenario: Verify services details textarea is displayed when Yes is selected

        When I select "Yes" for the question "Are any services provided in your tenancy?"
        Then I check that the text "Describe the services provided" is displayed on the page

    @AC3 @JIRA-TEST-KEY:PTSD-787
    Scenario: Verify Save and Continue with Yes selected

        When I select "Yes" for the question "Are any services provided in your tenancy?"
        And I enter "service is provided" for the question "Describe the services provided"
        And I click "Save and continue"
        Then I check that the text "What repairs are the landlord's responsibility? (optional)" is displayed on the page

    @AC4 @JIRA-TEST-KEY:PTSD-788
    Scenario: Verify Save and Continue with No selected

        When I select "No" for the question "Are any services provided in your tenancy?"
        And I click "Save and continue"
        Then I check that the text "What repairs are the landlord's responsibility? (optional)" is displayed on the page

    @AC5 @JIRA-TEST-KEY:PTSD-789
    Scenario: Verify Save for Later from Services Provided page

        When I select "Yes" for the question "Are any services provided in your tenancy?"
        And I enter "service is provided" for the question "Describe the services provided"
        And I click "Save for later"
        Then check that the user is redirected to the task-list citizen dashboard page

    @AC6 @JIRA-TEST-KEY:PTSD-790
    Scenario: Verify validation when no services option is selected

        When I click "Save and continue"
        Then I check that the error message "Select whether services are provided in your tenancy" is displayed on the page

    @AC7 @JIRA-TEST-KEY:PTSD-790
    Scenario: Verify validation when services details are blank

        When I select "Yes" for the question "Are any services provided in your tenancy?"
        And I click "Save and continue"
        Then I check that the error message "Enter the services provided in your tenancy" is displayed on the page

    @AC7 @JIRA-TEST-KEY:PTSD-790
    Scenario: Verify validation when services details are below minimum length

        When I select "Yes" for the question "Are any services provided in your tenancy?"
        And I enter "A" for the question "Describe the services provided"
        And I click "Save and continue"
        Then I check that the error message "Details about the services provided must be 2 characters or more" is displayed on the page