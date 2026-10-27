@JIRA-EPIC:HDPD-617 @regression

Feature: Validate  What repairs are the landlord's responsibility Page

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
        When I select "No" for the question "Are any services provided in your tenancy?"
        And I click "Save and continue"
        Then I check that the text "What repairs are the landlord's responsibility? (optional)" is displayed on the page


    @AC1 @JIRA-TEST-KEY:PTSD-931
    Scenario: Verify landlord repairs page content
        Then I check that the text "This is sometimes written in your tenancy agreement" is displayed on the page


    @AC2 @JIRA-TEST-KEY:PTSD-932
    Scenario: Verify Save and continue with details entered

        When I enter "Whitegood Repairs Included" for the question "What repairs are the landlord's responsibility? (optional)"
        And I click "Save and continue"
        Then I check that the text "What repairs are the tenant's responsibility? (optional)" is displayed on the page


    @AC3 @JIRA-TEST-KEY:PTSD-933
    Scenario: Verify Save and continue with blank textarea

        When I click "Save and continue"
        Then I check that the text "What repairs are the tenant's responsibility? (optional)" is displayed on the page