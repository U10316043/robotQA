$(document).ready(function () {
  $("#searchword").on('keyup', function () {
    var value = $(this).val().toLowerCase()
    $('td #mylist').filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    })
  })
})
