@JIRA-TEST-KEY:HDPD-548 @regression
Feature: Contact preferences phone number validation and save-for-later functionality
    As a tenant I want to enter my contact preferences with valid phone numbers
    So that I can complete the section successfully and save my application for later

    Background:
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

    @AC6
    Scenario: Required text update selection shows linked summary and inline error
        When I click "Save and continue"
        Then I should see an error summary link for "Select whether you want to receive text updates"
        And I should see inline error "Select whether you want to receive text updates" for the question "Do you want to receive text updates?"
        And the page URL should be "text-updates"
        When I click back link
        And I click "Contact preferences" link
        Then no option should be selected for the question "Do you want to receive text updates?"

    @AC6
    Scenario: Yes with an empty mobile number shows linked summary and inline error
        When I select "Yes" for the question "Do you want to receive text updates?"
        And I click "Save and continue"
        Then I should see an error summary link for "Phone number must be a mobile phone number, like 07700 900 982 or +44 7808157019"
        And I should see inline error "Phone number must be a mobile phone number, like 07700 900 982 or +44 7808157019" for the question "Enter a mobile phone number"
        And the page URL should be "text-updates"
        And "Yes" should be selected for text updates
        And I check "" for the question "Enter a mobile phone number"
        When I click back link
        And I click "Contact preferences" link
        Then no option should be selected for the question "Do you want to receive text updates?"

    @AC6
    Scenario: Yes with an invalid mobile number shows linked summary and inline error
        When I select "Yes" for the question "Do you want to receive text updates?"
        And I enter "08234342342333" for the question "Enter a mobile phone number"
        And I click "Save and continue"
        Then I should see an error summary link for "Phone number must be a mobile phone number, like 07700 900 982 or +44 7808157019"
        And I should see inline error "Phone number must be a mobile phone number, like 07700 900 982 or +44 7808157019" for the question "Enter a mobile phone number"
        And the page URL should be "text-updates"
        When I click back link
        And I click "Contact preferences" link
        Then no option should be selected for the question "Do you want to receive text updates?"

    Scenario: Invalid phone call number can be corrected and contact preferences retained
        When I select "Yes" for the question "Do you want to receive text updates?"
        And I enter "07728957829" for the question "Enter a mobile phone number"
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
        Given I select "Yes" for the question "Do you want to receive text updates?"
        And I enter "07728957829" for the question "Enter a mobile phone number"
        And I click "Save and continue"
        And I enter "07728957829" for the question "Enter a phone number for phone calls (optional)"
        And I click "Save and continue"
        And I click "Save for later"
        Then check that the user is redirected to the task-list citizen dashboard page
        When I click "Contact preferences" link
        And I click "Save and continue"
        And I click "Save and continue"
        Then I check that user lands on the "Check your answers" page
        When I click the change link for "Enter a mobile phone number"
        Then I should be taken to the text updates page
        And "Yes" should be selected for text updates
        And the mobile phone number field should contain "07728957829"

    @JIRA-TEST-KEY:PTSD-800
    Scenario: Contact preferences - Check your answers page - Phone call number should be displayed correctly
        Given I select "Yes" for the question "Do you want to receive text updates?"
        And I enter "07728957829" for the question "Enter a mobile phone number"
        And I click "Save and continue"
        And I enter "07728957829" for the question "Enter a phone number for phone calls (optional)"
        And I click "Save and continue"
        And I click "Save for later"
        Then check that the user is redirected to the task-list citizen dashboard page
        When I click "Contact preferences" link
        And I click "Save and continue"
        And I click "Save and continue"
        Then I check that user lands on the "Check your answers" page
        When I click the change link for "Enter a phone number for phone calls (optional)"
        Then I should be taken to the contact by phone call page
        And the phone number field should contain "07728957829"

    @JIRA-TEST-KEY:PTSD-801
    Scenario: Contact preferences check-your-answers content and all answered rows
        Given I select "Yes" for the question "Do you want to receive text updates?"
        And I enter "07728957829" for the question "Enter a mobile phone number"
        And I click "Save and continue"
        And I enter "07728957829" for the question "Enter a phone number for phone calls (optional)"
        And I click "Save and continue"
        And I click "Save for later"
        Then check that the user is redirected to the task-list citizen dashboard page
        When I click "Contact preferences" link
        And I click "Save and continue"
        And I click "Save and continue"
        Then I check that user lands on the "Check your answers" page
        And I should see the section heading "Contact preferences"
        And I should see the answer "Yes" for "Do you want to receive text updates?" and the change link
        And I should see the mobile phone number "07728957829" and the change link
        And I should see the phone call number "07728957829" and the change link
        And the page should include "You can review and change your answers before you submit your application."
        And I should see the button "Complete this section"
        And I should see the button "Save for later"

    @JIRA-TEST-KEY:PTSD-802
    Scenario: Contact preferences check-your-answers omits the mobile row when text updates are No
        Given I select "Yes" for the question "Do you want to receive text updates?"
        And I enter "07728957829" for the question "Enter a mobile phone number"
        And I click "Save and continue"
        And I enter "07728957829" for the question "Enter a phone number for phone calls (optional)"
        And I click "Save and continue"
        And I click "Save for later"
        Then check that the user is redirected to the task-list citizen dashboard page
        When I click "Contact preferences" link
        And I click "Save and continue"
        And I click "Save and continue"
        Then I check that user lands on the "Check your answers" page
        When I click the change link for "Do you want to receive text updates?"
        Then I should be taken to the text updates page
        When I select "No, I want to receive email updates only" for the question "Do you want to receive text updates?"
        And I click "Save and continue"
        And I click "Save and continue"
        Then I check that user lands on the "Check your answers" page
        And I should see the answer "No" for "Do you want to receive text updates?" and the change link
        And I should not see the summary row for "Enter a mobile phone number"

    @JIRA-TEST-KEY:PTSD-803
    Scenario: Contact preferences check-your-answers omits an unanswered optional phone number
        Given I select "Yes" for the question "Do you want to receive text updates?"
        And I enter "07728957829" for the question "Enter a mobile phone number"
        And I click "Save and continue"
        And I enter "07728957829" for the question "Enter a phone number for phone calls (optional)"
        And I click "Save and continue"
        And I click "Save for later"
        Then check that the user is redirected to the task-list citizen dashboard page
        When I click "Contact preferences" link
        And I click "Save and continue"
        And I click "Save and continue"
        Then I check that user lands on the "Check your answers" page
        When I click the change link for "Enter a phone number for phone calls (optional)"
        Then I should be taken to the contact by phone call page
        When I clear the field for the question "Enter a phone number for phone calls (optional)"
        And I click "Save and continue"
        Then I check that user lands on the "Check your answers" page
        And I should not see the summary row for "Enter a phone number for phone calls (optional)"

    @JIRA-TEST-KEY:PTSD-804
    Scenario: Contact preferences change saves the updated answer and returns to check your answers
        Given I select "Yes" for the question "Do you want to receive text updates?"
        And I enter "07728957829" for the question "Enter a mobile phone number"
        And I click "Save and continue"
        And I enter "07728957829" for the question "Enter a phone number for phone calls (optional)"
        And I click "Save and continue"
        And I click "Save for later"
        Then check that the user is redirected to the task-list citizen dashboard page
        When I click "Contact preferences" link
        And I click "Save and continue"
        And I click "Save and continue"
        Then I check that user lands on the "Check your answers" page
        When I click the change link for "Enter a mobile phone number"
        Then I should be taken to the text updates page
        And "Yes" should be selected for text updates
        And the mobile phone number field should contain "07728957829"
        When I enter "07927819057" for the question "Enter a mobile phone number"
        And I click "Save and continue"
        And I click "Save and continue"
        Then I check that user lands on the "Check your answers" page
        And I should see the mobile phone number "07927819057" and the change link