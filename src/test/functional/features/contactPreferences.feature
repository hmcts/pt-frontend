@JIRA-TEST-KEY:HDPD-548 @regression @CT
Feature: Contact preferences phone number validation and save-for-later functionality
    As a tenant I want to enter my contact preferences with valid phone numbers
    So that I can complete the section successfully and save my application for later

    Background: Contact preferences - Validate phone numbers and retained text updates on edit
        Given the user navigates to PT url
        And the user has successfully logged on to market-rent-determination application
        Then check that the user is redirected to the my-application page
        When user clicks on the my application link
        Then check that the user is redirected to the application-type page
        And I select the option "Challenge my rent as excessive within the first 6 months of the tenancy"
        And I click "Continue"
        Then check that the user is redirected to the "tenancy-type" page
        And I select the option "Assured periodic tenancy"
        And I click "Continue"
        And I click "Contact preferences" link
        And I click "Save and continue"
        Then I check for error message "Select whether you want to receive text updates"
        And I select "Yes" for the question "Do you want to receive text updates?"
        And I enter "08234342342333" for the question "Enter a mobile phone number"
        And I click "Save and continue"
        Then I enter "07728957829" for the question "Enter a mobile phone number"
        And I click "Save and continue"
        Then I enter "08234342342333" for the question "Enter a phone number for phone calls (optional)"
        And I click "Save and continue"
        Then I check for error message "Phone number must be in the correct format, like 01632 960 001, 07700 900 982 or +44 808 157 0192"
        And I enter "07728957829" for the question "Enter a phone number for phone calls (optional)"
        And I click "Save and continue"
        And I should see the button "Complete this section"
        Then check that the user lands on the "Check your answers" page
        And I click "Save for later"
        Then check that the user is redirected to the task-list citizen dashboard page
        When I click "Contact preferences" link
        And I click "Save and continue"
        And I click "Save and continue"
        Then check that the user lands on the "Check your answers" page
        When I click the change link for "Do you want to receive text updates?"
        Then I should be taken to the text updates page
        And "Yes" should be selected for text updates
        And the mobile phone number field should contain "07728957829"
        And I click "Save for later"
        Then check that the user is redirected to the task-list citizen dashboard page

    @JIRA-TEST-KEY:PTSD-799
    Scenario: Contact preferences - Check your answers page - Enter a mobile phone number should be displayed correctly
        Given I click "Contact preferences" link
        And I click "Save and continue"
        And I click "Save and continue"
        Then I check that user lands on the "Check your answers" page
        When I click the change link for "Enter a mobile phone number"
        Then I should be taken to the text updates page
        And "Yes" should be selected for text updates
        And the mobile phone number field should contain "07728957829"

    @JIRA-TEST-KEY:PTSD-800
    Scenario: Contact preferences - Check your answers page - Phone call number should be displayed correctly
        Given I click "Contact preferences" link
        And I click "Save and continue"
        And I click "Save and continue"
        Then I check that user lands on the "Check your answers" page
        When I click the change link for "Enter a phone number for phone calls (optional)"
        Then I should be taken to the contact by phone call page
        And the phone number field should contain "07728957829"