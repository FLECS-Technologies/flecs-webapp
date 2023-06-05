/*
 * Copyright (c) 2023 FLECS Technologies GmbH
 *
 * Created on Fri Jun 02 2023
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
