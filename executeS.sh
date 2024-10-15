test_output=$(npx playwright test --reporter=dot 2>&1)
exit_status=$?
echo 'AFTER1::'
#echo "AFTER2:: $test_output"
failed_count=$(echo "$test_output" | grep -oP '\d+ failed' | awk '{print $1}')
echo 'test_dataOUTPUT::'
echo "${failed_count}"

echo "${exit_status}" 
if [ $exit_status -ne 0 ]; then
  echo "Tests failed: Not working"
else
  echo "Tests passed: All good"
fi
echo 'AFTER3::'




test_data="text raji"
echo "${test_data}"