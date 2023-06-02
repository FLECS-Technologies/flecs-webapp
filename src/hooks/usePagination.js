import useStateWithLocalStorage from '../components/LocalStorage'

const usePagination = (name, initialPage, initialRowsPerPage) => {
  const [page, setPage] = useStateWithLocalStorage(`${name}.paginator.page`, initialPage)
  const [rowsPerPage, setRowsPerPage] = useStateWithLocalStorage(`${name}.paginator.rowsPerPage`, initialRowsPerPage)

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  return {
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage
  }
}

export default usePagination
