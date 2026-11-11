$(function () {
  // Content is visible from the first paint, even if scripts fail to load.
  if ($('#sidebar').data('display')) $('#toggle-sidebar').trigger('click')
})
