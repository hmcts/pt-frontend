@JIRA-TEST-KEY:HDPD-619 @regression
Feature: Upload evidence of improvements or repairs

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
        Given the citizen is on the Upload evidence of the improvements or repairs page

    @AC1 @JIRA-TEST-KEY:PTSD-938

    Scenario: Page content
        Then the page displays the heading "Upload evidence of the improvements or repairs (optional)"
        And the file upload component is displayed
        And the page displays "Save and continue" button
        And the page displays "Save for later" button

    @AC2 @JIRA-TEST-KEY:PTSD-939
    Scenario: Upload valid file
        When the citizen uploads a valid tenancy agreement file
        Then the uploaded file name is displayed

    @AC3 @JIRA-TEST-KEY:PTSD-940
    Scenario: Save and continue
        And the citizen has uploaded a valid tenancy agreement file
        When  I click 'Save and continue'
        Then the citizen is taken to the Check your answers page

    @AC4 @JIRA-TEST-KEY:PTSD-941
    Scenario: No file selected validation
        When  I click 'Save and continue'
        Then the citizen is taken to the Check your answers page

    @AC5 @JIRA-TEST-KEY:PTSD-942
    Scenario: Save for later
        When I click "Save for later"
        Then check that the user is redirected to the task-list citizen dashboard page

    @AC6 @JIRA-TEST-KEY:PTSD-943
    Scenario: empty file type
        When the citizen has uploaded a empty tenancy agreement file
        And  I click 'Save and continue'
        Then I check that the error message "The selected file is empty" is displayed on the page
        When  I click 'Save and continue'
        Then the citizen is taken to the Check your answers page

    @AC7 @JIRA-TEST-KEY:PTSD-943-1
    Scenario: empty file type
        When the citizen has uploaded unsuppprted file
        And  I click 'Save and continue'
        Then I check that the error message "The selected file must be a DOC, DOCX, XLS, XLSX, PPT, PPTX, PDF, RTF, TXT, CSV, JPG, JPEG, PNG, BMP, TIF or TIFF" is displayed on the page
        When  I click 'Save and continue'
        Then the citizen is taken to the Check your answers page


