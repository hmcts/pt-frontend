@JIRA-TEST-KEY:HDPD-613 @regression
Feature: Property details - Upload photos outside of the property
    As a PT user completing the form
    I want to upload photos of the outside of the property

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
        Given I click "Property details" link
        Then check that the user is redirected to the property-details page
        When I enter "100" for the question "Address line 1"
        And I enter "Test Street" for the question "Address line 2 (optional)"
        And I enter "London" for the question "Town or city"
        And I enter "E1 1AA" for the question "Postcode"
        And I click "Save and continue"
        When I select "Fully detached house" for the question "What are you renting?"
        And I click "Save and continue"
        When I select "No" for the question "Do you have a floor plan of the property?"
        And I enter "Room 1: 10x10, Room 2: 12x12" for the question "Tell us the number and type of rooms, and their sizes (optional)"
        And I click "Save and continue"
        And I click "Save and continue"
        When I select "No" for the question "Does the tenancy include any other facilities?"
        And I click "Save and continue"
        When I select "No" for the question "Do you share the property with your landlord?"
        And I click "Save and continue"
        Then the page should include "Upload a photo of the outside of the property (optional)"

    @JIRA-TEST-KEY:PTSD-951
    Scenario: Check that Property pictures can be uploaded and saved for later
        When I upload "supported-file"
        And I check that file name "supportedFile.docx" is displayed on the page with green tick mark
        And I check that "Remove" button is displayed on the page
        And I click on the "Remove" button
        Then I check that file name "supportedFile.docx" is not displayed on the page
        And I click "Save for later"
        Then check that the user is redirected to the task-list citizen dashboard page

    @JIRA-TEST-KEY:PTSD-952
    Scenario: Show an error when more than three property photos are selected
        When I select 4 files from "test-image.jpg" for upload
        Then I check for error message "You can only select up to 3 files at the same time"

    @JIRA-TEST-KEY:PTSD-953
    Scenario: Upload three property photos in parallel
        When I upload files "test-image.jpg, test-pdf.pdf, test-png.png" in parallel
        Then I check that file name "test-image.jpg" is displayed on the page with green tick mark
        And I check that file name "test-pdf.pdf" is displayed on the page with green tick mark
        And I check that file name "test-png.png" is displayed on the page with green tick mark
        And I click "Save for later"
        Then check that the user is redirected to the task-list citizen dashboard page
