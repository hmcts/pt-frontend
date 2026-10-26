@JIRA-TEST-KEY:HDPD-619 @regression
Feature: Verify Upload evidence of improvements or repairs page

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
        And I click "Save and continue"
        And I click "Save and continue"
        Then I check that the text "Repairs and improvements" is displayed on the page
        And I click "Save and continue"
        When I select "Yes" for the question "Have you or any past tenants made any changes or repairs to the property?"
        And I click "Save and continue"
        Then I check that the text "Upload evidence of the improvements or repairs (optional)" is displayed on the page

    @AC1 @JIRA-TEST-KEY:PTSD-938

    Scenario: Page content

        Then I check that the text "Upload a file" is displayed on the page
        And I check that the text "drop file" is displayed on the page

    @AC2 @JIRA-TEST-KEY:PTSD-939
    Scenario: Upload valid file

        When I upload "supported-file"
        Then I check that the text "Files added" is displayed on the page


    @AC3 @JIRA-TEST-KEY:PTSD-940
    Scenario: Save and continue

        When I upload "supported-file"
        When  I click 'Save and continue'
        Then I check that the text "Check your answers" is displayed on the page

    @AC4 @JIRA-TEST-KEY:PTSD-941
    Scenario: No file selected validation

        When  I click 'Save and continue'
        Then I check that the text "Check your answers" is displayed on the page

    @AC5 @JIRA-TEST-KEY:PTSD-942
    Scenario: Save for later

        When I click "Save for later"
        Then check that the user is redirected to the task-list citizen dashboard page

    @AC6 @JIRA-TEST-KEY:PTSD-943
    Scenario: empty file type

        When I upload "empty-file"
        Then I check that the error message "The selected file is empty" is displayed on the page
        When  I click 'Save and continue'
        Then I check that the text "Check your answers" is displayed on the page

