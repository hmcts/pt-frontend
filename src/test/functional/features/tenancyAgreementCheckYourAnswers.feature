@JIRA-TEST-KEY:HDPD-589 @regression
Feature: Verify Tenancy Agreement Check Your Answers

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
        When I click "Your tenancy agreement" link
        Then I check that the text "Do you have a copy of your tenancy agreement to upload?" is displayed on the page



    @AC1 @JIRA-TEST-KEY:PTSD-886 @AC2 @JIRA-TEST-KEY:PTSD-887
    Scenario: Verify page content and answer summary

        When I select "Yes" for the question "Do you have a copy of your tenancy agreement to upload?"
        And I click 'Save and continue'
        Then I check that the text "Upload tenancy agreement" is displayed on the page
        When I upload "supported-file"
        And I click 'Save and continue'
        Then I check that the text "Check your answers" is displayed on the page
        Then I check that the text "Do you have a copy of your tenancy agreement to upload?" is displayed on the page
        And I check that the text "Yes" is displayed on the page
        And the field "Change" is "displayed"
        


    @AC3 @JIRA-TEST-KEY:PTSD-888
    Scenario: Verify reason row is displayed when No selected

        When I select "No" for the question "Do you have a copy of your tenancy agreement to upload?"
        And I enter "I do not have a copy of my agreement" for the question "Why can you not upload your tenancy agreement?"
        And  I click 'Save and continue'
        Then I check that the text "Check your answers" is displayed on the page
        Then I check that the text "No" is displayed on the page
        And I check that the text "Do you have a copy of your tenancy agreement to upload?" is displayed on the page
        And I check that the text "Why can you not upload your tenancy agreement?" is displayed on the page
        And the field "Change" is "displayed"
        Then the field "Upload tenancy agreement" is "not displayed"


    @AC4 @JIRA-TEST-KEY:PTSD-889
    Scenario: Verify Change link updates tenancy agreement answer

        When I select "Yes" for the question "Do you have a copy of your tenancy agreement to upload?"
        And I click 'Save and continue'
        Then I check that the text "Upload tenancy agreement" is displayed on the page
        When I upload "supported-file"
        And I click 'Save and continue'
        Then I check that the text "Check your answers" is displayed on the page
        Then I check that the text "Do you have a copy of your tenancy agreement to upload?" is displayed on the page
        And I check that the text "Yes" is displayed on the page
        And the field "Change" is "displayed"
        When I click the change link for "Do you have a copy of your tenancy agreement to upload?"
        And I select "No" for the question "Do you have a copy of your tenancy agreement to upload?"
        And I enter "I do not have a copy of my agreement" for the question "Why can you not upload your tenancy agreement?"
        And  I click 'Save and continue'
        And I check that the text "Check your answers" is displayed on the page
        Then I check that the text "No" is displayed on the page


    @AC5 @JIRA-TEST-KEY:PTSD-890
    Scenario: Complete tenancy agreement section

        When I select "No" for the question "Do you have a copy of your tenancy agreement to upload?"
        And I enter "I do not have a copy of my agreement" for the question "Why can you not upload your tenancy agreement?"
        And  I click 'Save and continue'
        Then I check that the text "Check your answers" is displayed on the page
        Then I check that the text "No" is displayed on the page
        And I check that the text "Do you have a copy of your tenancy agreement to upload?" is displayed on the page
        And I check that the text "Why can you not upload your tenancy agreement?" is displayed on the page
        And the field "Change" is "displayed"
        And the field "Upload tenancy agreement" is "not displayed"
        When I click "Complete this section"
        Then check that the user is redirected to the task-list citizen dashboard page

    @AC6 @JIRA-TEST-KEY:PTSD-891
    Scenario: Save tenancy agreement section for later

        When I select "No" for the question "Do you have a copy of your tenancy agreement to upload?"
        And I enter "I do not have a copy of my agreement" for the question "Why can you not upload your tenancy agreement?"
        And  I click 'Save and continue'
        Then I check that the text "Check your answers" is displayed on the page
        Then I check that the text "No" is displayed on the page
        And I check that the text "Do you have a copy of your tenancy agreement to upload?" is displayed on the page
        And I check that the text "Why can you not upload your tenancy agreement?" is displayed on the page
        And the field "Change" is "displayed"
        And the field "Upload tenancy agreement" is "not displayed"
        When I click "Save for later"
        Then check that the user is redirected to the task-list citizen dashboard page