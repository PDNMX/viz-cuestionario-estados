function chartPictograma(data, tipo) {
  document.getElementById('pictograma').innerHTML = '';
  data = data.sort(function (a, b) {
    return d3.descending(+a[tipo], +b[tipo]);
  });
  const table = d3.select('#pictograma').append('table');
  
  table.append('thead');
  table.append('tbody');
  const columns = [
    {
      head: '',
      cl: 'entidad',
      width: '20%',
      html(row) {
        const text = `<span class='title'>${row.entidad}</span>`;
        return text;
      },
    },
    {
      head: 'Puntaje',
      cl: tipo,
      width: '60%',
      html(row) {
        const icon = `<span class="icon icon-${tipo}"></span>`;
        const value = row[tipo];
        const nIcons = row[tipo];
        const text = `<span class='text'>${value}</span>`;
        //console.log(nIcons)
        return text + d3.range(nIcons)
          .map(() => icon).join('');
      },
    },
    {
      head: 'Diferencia con el trimestre anterior',
      cl: tipo + '_dif',
      width: '20%',
      html(row) {
        let value;
        if (Number.isNaN(row[tipo + '_dif'])) {
          value = `n/a`
        } else {
          value = `${row[tipo + '_dif']}%`
        }
        const scale = d3.scaleThreshold()
          .domain([0, 10])
          .range(['fa-arrow-down', 'fa-equals', 'fa-arrow-up']);

        const icon = `<span class='fa ${scale(row[tipo + '_dif'])}'></span>`;
        //const value = `${row[tipo + '_dif']}%`
        const text = `<span class='text'>${value}</span>`;
        return text + icon;
      },
    }
  ];

  table.call(renderTable);

  function renderTable(table) {
    const tableUpdate = table.select('thead')
      .selectAll('th')
      .data(columns);

    const tableEnter = tableUpdate
      .enter().append('th')
        /* .attr('class', d => d.cl) */
        .style("width", d => d.width)
        .text(d => d.head)
        .on('click', (d) => {
          let ascending;
          if (d.ascending) {
            ascending = false;
          } else {
            ascending = true;
          }
          d.ascending = ascending;
          data.sort((a, b) => {
            if (ascending) {
              return d3.ascending(a[d.cl], b[d.cl]);
            }
            return d3.descending(a[d.cl], b[d.cl]);
          });
          table.call(renderTable);
        });

    const trUpdate = table.select('tbody').selectAll('tr')
      .data(data);

    const trEnter = trUpdate.enter().append('tr');

    const trMerge = trUpdate.merge(trEnter)
      .on('mouseenter', mouseenter)
      .on('mouseleave', mouseleave);

    const tdUpdate = trMerge.selectAll('td')
      .data((row, i) => columns.map((c) => {
        const cell = {};
        d3.keys(c).forEach((k) => {
          cell[k] = typeof c[k] === 'function' ? c[k](row, i) : c[k];
        });
        return cell;
      }));

    const tdEnter = tdUpdate.enter().append('td');

    tdEnter
      .attr('class', d => d.cl)
      .style('background-color', '#0d3b49')
      /* .style('border-bottom', '.5px solid white') */;

    tdEnter.merge(tdUpdate).html(d => d.html);
  }
}

function mouseenter() {
  d3.select(this).selectAll('td')
    .style('background-color', 'rgba(0, 0, 0, 0.20)')
    .style('font-color', 'red')
    /* .style('border-bottom', '.5px solid slategrey') */;
}

function mouseleave() {
  d3.select(this).selectAll('td')
    .style('background-color', '#0d3b49');
}
